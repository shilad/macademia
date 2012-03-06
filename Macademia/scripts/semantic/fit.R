#install.packages('leaps');
#install.packages('MASS');

require(leaps)
require(MASS)


data <- read.table("gold-sample/joined.r.txt", header = TRUE);

all3 <- data[data$n == 3,];
justcat <- data[data$n == 1,];

sigmoid <- function(x) {
    1 / (1 + exp(-x));
}

percentile <- function(r) {
    1 - r / 20000.0;
}

"exploring records with only category"

summary(justcat);
sapply(justcat, mean, na.rm=TRUE);
sapply(justcat, sd, na.rm=TRUE);
justcat$catp <- percentile(justcat$catr);
summary(lm(justcat$y ~ justcat$catp));

"complete records"

#all3$wordsig <- sigmoid(scale(all3$words));
#all3$linksig <- sigmoid(scale(all3$links));
all3$catp <- percentile(all3$catr);
all3$links[is.na(all3$links)] = -0.05;
all3$linkk[is.na(all3$links)] = -0.05;
all3$words[is.na(all3$words)] = -0.05;
all3$wordk[is.na(all3$words)] = -0.05;
all3$catp[is.na(all3$catp)] = -0.01;

summary(all3);
sapply(all3, mean, na.rm=TRUE);
sapply(all3, sd, na.rm=TRUE);

apply(all3, 2, function (v) { cor(all3$y[!is.na(v)], v[!is.na(v)]); });

summary(lm(y ~ words + links + catp, all3));

stop("end");


evalfields <- function(fields) {
    rows <- all3;
    if ("links" %in% fields) {
        rows <- rows[!is.na(rows$links),];
    } else {
        rows <- rows[is.na(rows$links),];
    }
    if ("words" %in% fields) {
        rows <- rows[!is.na(rows$words),];
    } else {
        rows <- rows[is.na(rows$words),];
    }
    if ("catp" %in% fields) {
        rows <- rows[!is.na(rows$catp),];
    } else {
        rows <- rows[is.na(rows$catp),];
    }
    print(sprintf(
        "exploring model with exactly defined fields: %s (n<-%s)",
        paste(fields, collapse<-", "),
        dim(rows)[1]
    ));
    mat <- rows[c("y", fields)];
    if (length(fields) == 1) {
        print(lm(mat));
    } else {
        print(lm(mat));
        #print(lm.ridge(mat, lambda=0.0));
    }

    print("");
    print("");
}

evalnfields <- function(n) {
    combn(c("links", "words", "catp"), n, evalfields);
}

z <- lapply(c(1,2,3), evalnfields);
