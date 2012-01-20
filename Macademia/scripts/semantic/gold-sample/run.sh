#s3cmd -f --no-progress get s3://macademia/nbrvz/tf-idf-links/gold-sample/part-r-00000.gz ./gold-sample/links.txt.gz &&
#s3cmd -f --no-progress get s3://macademia/nbrvz/tf-idf-words/gold-sample/part-r-00000.gz ./gold-sample/words.txt.gz &&
#s3cmd -f --no-progress get s3://macademia/nbrvz/categories/gold-sample/part-r-00000.gz ./gold-sample/cats.txt.gz &&
python2.6 mk_r_input_file.py >./gold-sample/joined.r.txt &&
R -f fit.R >res/semantic_model.R.out
