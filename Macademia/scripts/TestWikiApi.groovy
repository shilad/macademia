import org.macademia.*


Person.withTransaction {

    WikipediaService wikipediaService = ctx.getBean("wikipediaService")

    DiskMap googleDm = new DiskMap(new File("db/prodgoogle_cache.txt"))
    DiskMap wikiDm = new DiskMap(new File("db/prodwiki_cache.txt"))
    for (String key : googleDm.cache.keySet()) {
        wikiDm.put(key, wikipediaService.query(URLDecoder.decode(key), 1))
    }

}