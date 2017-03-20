/**
 * Created by rodriguesc on 03/03/2017.
 */
const debug = require('debug')('gin-downloader:mangahere');
const verbose = require('debug')('gin-downloader:mangahere:verbose');

import osmosis from 'osmosis';

import uri from 'url';

import _ from 'lodash';
import libxmljs from 'libxmljs';


import manga from './parser';
import config from './config';
import {finder} from './parser';
import {getHtml} from '../common/request';
import {resolveUrl} from './names';

const mangas = () => {
  debug('getting mangas');
  return getHtml(config.mangas_url)
    .tap(x=>verbose(x))
    .tap(()=>debug('got html'))
    .then(x=>libxmljs.parseHtmlString(x))
    .then(manga.mangas)
    .tap(x=>debug(`mangas: ${x.length}`));
};

const latest= ()=>{
  debug('getting latest');
  let osm = osmosis.get(config.latest_url);
  return manga.latest(osm)
    .tap(x=>debug(`found: ${x.length}`));
};

const info= (name) =>{
  debug(`getting info for ${name}`);

  let src = resolveUrl(name);
  debug(`getting info ${src}`);
  let osm = osmosis.get(src);

  return manga.mangaInfo(osm)
    .tap(x=>debug('info: %s',x));
};

const chapters = (name) =>{
  debug(`getting chapters ${name}`);
  let src = resolveUrl(name);

  let osm = osmosis.get(src);
  return manga.chapters(osm)
    .catch(x=>{throw new Error('Chapters not found',x);})
    .tap(x=>debug(`chapters: ${x.length}`));
};

const images = (url) => {
  debug(`getting images ${url}`);
  return imagesPaths(url)
    .tap(x=>debug(`images: ${x.length}`))
    .then(x=>x.map(image))
    .tap(x=>debug(`images resolved : ${x}`));
};

const imagesPaths = (url)=>{
  debug(`getting image paths ${url}`);
  return getHtml(url)
    .tap(x=>verbose('html: %s', x))
    .then(html=>libxmljs.parseHtmlString(html))
    .then(x=>finder.findImagesPath(x))
    .then(x=>x.map(t=>uri.resolve(url, t.value())))
    .tap(x=>debug(`found ${x.length} images:\n${x}`))
    ;
};

const image = (url)=>{
  const __imgID__ = /src=".*\?token[^"]*".*id=/gmi;
  const __img__ = /src=".*\?token[^"]*/gmi;
  debug(`getting image from ${url}`);

  return getHtml(url)
    .tap(x=>verbose('html: %s', x))
    .then(html=>html.match(__imgID__))
    .then(x=>x[0])
    .tap(x=>debug(`match image : ${x}`))
    .then(x=>x.match(__img__))
    .then(x=>x[0].slice(5));
};


const resolve = (name, chapter)=>{
  debug(`resolve ${name}:${chapter}`);

  return chapters(name)
    .then(chaps=>{
      return _.find(chaps,{number:`${name} ${chapter}`});
    })
    .tap(x=>debug('found %o',x))
      .then(x=>{
        if(!x)
          throw new Error(`chapter ${chapter} not found`);
        return images(uri.resolve(config.site, x.url));
      });
};


export default {
  name : config.name,

  mangas,
  info,
  chapters,
  images,
  imagesPaths,
  resolve,
  latest
};