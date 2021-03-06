/**
 * Created by rodriguesc on 24/03/2017.
 */
import {Chapter, FilteredResults, MangaInfo, MangaSource, MangaXDoc, SiteParser} from "../../declarations";
import {resolve} from "url";
import * as url from "url";

import {config} from "./config";
import {Element} from "libxmljs";


export class Parser implements SiteParser {
  mangas(doc: MangaXDoc): Promise<MangaSource[]> | MangaSource[] {
    const xpath = "//div[@class='manga_list']/ul/li/a";
    return doc.find(xpath).map(x => {
      return {
        name: x.text(),
        src: resolve(config.site, x.attr("href").value())
      };
    });
  }

  latest(doc: MangaXDoc): Promise<Chapter[]> | Chapter[] {
    const xpath = "//dt/span/a[@class='chapter']";
    return doc.find(xpath).map(x => Parser.parseChapter(x, "following-sibling::text()"));
  }

  info(doc: MangaXDoc): Promise<MangaInfo> | MangaInfo {
    let image = doc.get("//div[@class='cover']/img").attr("src").value();
    let title = doc.get("//div[@class='cover']/img").attr("alt").value();
    let synonyms = doc.get("//div[@id='title']/h3").text().split("; ");
    let released = doc.get("//div[@id='title']/table/tr[2]/td[1]/a").text();
    let authors = [doc.get("//div[@id='title']/table/tr[2]/td[2]/a").text()];
    let artists = [doc.get("//div[@id='title']/table/tr[2]/td[3]/a").text()];
    let genres = doc.find("//div[@id='title']/table/tr[2]/td[4]/a").map(x => x.text());
    let synopsis = doc.get("//div[@id='title']/p").text();
    let status = doc.get("//div[@id='series_info']/div[@class='data'][1]/span/text()[1]").text().trim().slice(0, -1);
    let ranked = doc.get("//div[@id='series_info']/div[@class='data'][2]/span").text();
    let rating = doc.get("//div[@id='series_info']/div[@class='data'][3]/span").text();
    let scanlators = doc.find("//div[@id='series_info']/div[@class='data'][4]/span/a").map(x => x.text());

    return {
      image,
      title,
      synonyms,
      released,
      authors,
      artists,
      genres,
      synopsis,
      status,
      ranked,
      rating,
      scanlators
    };
  }

  chapters(doc: MangaXDoc): Promise<Chapter[]> | Chapter[] {
    const xpath = "//div[@id='chapters']/ul/li/div//a[@class='tips']";
    return doc.find(xpath).map(x => Parser.parseChapter(x, "preceding::div[@class='slide']/h3/text()"));
  }


  private static parseChapter(x: Element, xVolume: string) {
    return {
      chap_number : x.text().lastDigit(),
      name: (x.get("following-sibling::span/text()") || x).text(),
      src: resolve(config.site, x.attr("href").value()),
      volume: x.get(xVolume).text().trim()
    };
  }

  imagesPaths(doc: MangaXDoc): string[] {
    const xpath = "//form[@id='top_bar']/div/div[@class='l']/select/option[position()< last()]/text()";
    return doc.find(xpath)
      .map(x => resolve(doc.location, `${x.text()}.html`));
  }

  image(html: string): string {
    const __imgID__ = /src=".*\?token[^"]*".*id=/gmi;
    const __img__ = /src=".*\?token[^"]*/gmi;

    let m = html.match(__imgID__);
    if (!m || m.length === 0) {
      throw new Error("Image not found");
    }
    m = m[0].match(__img__);
    if (!m || m.length === 0) {
      throw new Error("Image not found");
    }

    return m[0].slice(5);
  }


  filter(doc: MangaXDoc): Promise<FilteredResults> | FilteredResults {
    const xpath = "//a[@class='title series_preview top']";

    let mangas = doc.find(xpath).map(x => {
      return {
        name: x.text(),
        src: x.attr("href").value()
      };
    });

    let page = 1;
    let query = url.parse(doc.location).query;
    if (query) {
      let m = query.toString().match(/page=(\d+)/g);
      if (m) {
        page = +m[1];
      }
    }

    let lastPageElement = doc.get("//div[@id='nav']/ul/li[last()-1]/a");
    let lastPage = 1;

    if (lastPageElement) {
      lastPage = +lastPageElement.text();
    }

    return <FilteredResults>{
      results: mangas,
      page: page,
      total: lastPage
    };
  }
}

export const parser = new Parser();
export default parser;
