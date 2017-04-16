/**
 * Created by rodriguesc on 24/03/2017.
 */
import { Chapter, FilteredResults, MangaInfo, MangaSource, MangaXDoc, SiteParser } from "../../declarations";
export declare class Parser implements SiteParser {
    mangas(doc: MangaXDoc): Promise<MangaSource[]> | MangaSource[];
    latest(doc: MangaXDoc): Promise<Chapter[]> | Chapter[];
    info(doc: MangaXDoc): Promise<MangaInfo> | MangaInfo;
    chapters(doc: MangaXDoc): Promise<Chapter[]> | Chapter[];
    private static parseChapter(x, xVolume);
    imagesPaths(doc: MangaXDoc): string[];
    image(html: string): string;
    filter(doc: MangaXDoc): Promise<FilteredResults> | FilteredResults;
}
export declare const parser: Parser;
export default parser;
