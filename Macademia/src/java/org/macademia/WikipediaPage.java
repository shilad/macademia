package org.macademia;

import java.util.List;

/**
 * A single wikipedia page, as represented in MongoDB.
 */
public class WikipediaPage {
    private long pageId;
    private int viewCount;
    private String title;
    List<Long> disambiguatedIds = null;
    private long redirectId = -1;

    public WikipediaPage(long pageId, String title, int viewCount) {
        this.pageId = pageId;
        this.viewCount = viewCount;
        this.title = title;
    }

    public boolean isDisambiguation() {
        return disambiguatedIds != null;
    }

    public boolean isRedirect() {
        return redirectId >= 0;
    }

    public void setDisambiguatedIds(List<Long> disambiguatedIds) {
        this.disambiguatedIds = disambiguatedIds;
    }

    public void setRedirectId(long redirectId) {
        this.redirectId = redirectId;
    }

    public long getPageId() {
        return pageId;
    }

    public int getViewCount() {
        return viewCount;
    }

    public String getTitle() {
        return title;
    }

    public List<Long> getDisambiguatedIds() {
        return disambiguatedIds;
    }

    public long getRedirectId() {
        return redirectId;
    }

    public String toString() {
        return "<page id=" + pageId+ " count=" + viewCount + " title='" + title + "'>";
    }
}
