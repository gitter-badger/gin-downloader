/**
 * Created by rodriguesc on 06/03/2017.
 */
import "./../../common";

import {manga} from "./../../../src/sites/mangahere";
import results from "./_results";
import {helper} from "../../../src/sites/mangahere/names";
import {FilterCondition, FilterMangaType, FilterStatus, FilterSupport, Genre} from "../../../src/declarations";


describe("MangaHere live", () => {

  it("should get all mangas", done => {
    manga.mangas()
      .should.eventually.have.length.gte(results.mangas_count)
      .notify(done);
  });

  it("should get latest chaps", done => {
    manga.latest()
      .should.eventually
      .to.have.length.gte(98)
      .notify(done);
  });

  it("should get info", done => {
    let name = "Gintama";
    manga.info(name)
      .then(info => {
        info.should.exist;

        info.title.should.be.eq(results.manga.title);
        info.synopsis.should.contain(results.manga.synopsis);
        info.status.should.be.eq(results.manga.status);

        info.synonyms.should.be.deep.eq(results.manga.synonyms);
        info.authors.should.be.deep.eq(results.manga.authors);
        info.artists.should.be.deep.eq(results.manga.artists);
        info.genres.should.be.deep.eq(results.manga.genres);

      }).should.eventually.notify(done);
  });

  it("should resolve name to name", async () => {
    let mangas = await manga.mangas();

    for (let obj of mangas){
      let expected = obj.src;
      let origName = obj.name;
      let finalUrl = manga.resolveMangaUrl(origName);

      finalUrl.should.be.eq(expected, `with name "${origName}"`);
    }
  });


  it("should not find manga by name", done => {
    let name = "my stupid name";
    let chapter = 1;

    manga.images(name, chapter)
      .should.eventually.be.rejectedWith(Error)
      .notify(done);
  });



  it("should not find get chapters", done => {
    let name = "Gintamass";

    manga.chapters(name)
      .should.eventually.be.empty
      .notify(done);
  });

  it("should not find chapter", done => {
    let name = "Gintama";
    let chapter = -354564;

    manga.images(name, chapter)
      .should.eventually.be.rejectedWith(Error)
      .notify(done);
  });

  it("should not find images chapter ", done => {
    let name = "Gintama";
    let chapter = -5151;

    manga.images(name, chapter)
      .should.eventually.be.rejectedWith(Error)
      .notify(done);
  });


  it("should get chapters", done => {
    let name = "Gintama";

    manga.chapters(name)
      .should.eventually.have.length.gte(results.chapter_count)
      .notify(done);
  });

  it("should get Gintama : chapter 41", async () => {
    let name = "Gintama";
    let chapter = 41;

    let images = await manga.images(name, chapter);
    images.should.to.exist;
    images.should.have.length.gte(17);

    let img = await images[0];
    img.src.should.contain("mhcdn.net/store/manga/551/041.0/compressed/M7_Gintama_ch041_00.jpg");
  });

  describe("filter", () => {

    it("should filter by name", async () => {
      let filter: FilterSupport = {
        name: "Gintama"
      };

      let mangas = await manga.filter(filter);
      mangas.results.should.length.gte(14);
      mangas.results.should.deep.include({
        name: "Gintama",
        src : "http://www.mangahere.co/manga/gintama/"
      });
    });


    it("should filter by name endWith", async () => {
      let filter: FilterSupport = {
        search: {
          name : {
            name: "Gintama",
            condition : FilterCondition.EndsWith
          }
        }
      };

      let mangas = await manga.filter(filter);
      mangas.results.should.length(1);
      mangas.results.should.deep.include({
        name: "Gintama",
        src : "http://www.mangahere.co/manga/gintama/"
      });
    });

    it("should filter by name startsWith", async () => {
      let filter: FilterSupport = {
        search: {
          name : {
            name: "Gintama",
            condition : FilterCondition.StartsWith
          }
        }
      };

      let mangas = await manga.filter(filter);
      mangas.results.should.length.gte(14);
      mangas.results.should.deep.include({
        name: "Gintama",
        src : "http://www.mangahere.co/manga/gintama/"
      });
    });

    it("should filter by in genre", async () => {
      let filter: FilterSupport = {
        genres: [Genre.Action, Genre.Adventure, Genre.Comedy, Genre.Drama, Genre.Historical, Genre.SciFi, Genre.Shounen, Genre.Supernatural]
      };

      let mangas = await manga.filter(filter);
      mangas.results.should.length(1);
      mangas.results.should.deep.include({
        name: "Gintama",
        src : "http://www.mangahere.co/manga/gintama/"
      });
    });

    it("should filter by out genre", async () => {
      let filter: FilterSupport = {
        outGenres: [Genre.Romance],
        search: {
          name: {
            name: "gin",
            condition: FilterCondition.StartsWith
          },
          author: {
            name: "Sora",
          }
        }

      };

      let mangas = await manga.filter(filter);
      mangas.results.should.length.gte(1);
      mangas.results.should.deep.include({
        name: "Gintama",
        src : "http://www.mangahere.co/manga/gintama/"
      });
    });

    it("should filter by Author", async () => {
      let filter: FilterSupport = {
        search: {
          author: {
            name: "Sorachi",
          }
        }
      };

      let mangas = await manga.filter(filter);
      mangas.results.should.length.gte(1);
      mangas.results.should.length.lte(10);
      mangas.results.should.deep.include({
        name: "Gintama",
        src : "http://www.mangahere.co/manga/gintama/"
      });
    });

    it("should filter by Status", async () => {
      let filter: FilterSupport = {
        search: {
          status: FilterStatus.Complete,
          name: {
            name: "kenichi"
          }
        }
      };

      let mangas = await manga.filter(filter);
      mangas.results.should.length.gte(1);
      mangas.results.should.deep.include({
        name: "Historys Strongest Disciple Kenichi",
        src : "http://www.mangahere.co/manga/historys_strongest_disciple_kenichi/"
      });
    });

    it("should filter by Type", async () => {
      let filter: FilterSupport = {
        search: {
          name: {
            name: "10"
          },
          type: FilterMangaType.Manhwa
        }
      };

      let mangas = await manga.filter(filter);
      mangas.results.should.length.gte(1);
      mangas.results.should.deep.include({
        name: "100 Ways to Kill A Seal",
        src : "http://www.mangahere.co/manga/100_ways_to_kill_a_seal/"
      });
    });
  });
});
