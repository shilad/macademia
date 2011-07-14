package org.macademia

import grails.test.GrailsUnitTestCase
import org.springframework.web.multipart.MultipartFile
import javax.media.jai.RenderedOp
import javax.media.jai.JAI
import org.springframework.mock.web.MockMultipartFile

/**
 * Shilad Sen
 */

class ImageTests extends GrailsUnitTestCase {
    private static File TEST_IMG = new File("web-app/images/shilad.jpg")
    
    File tmpDir
    ImageService is

    protected void setUp() {
        tmpDir = File.createTempFile("imageTest", "")
        tmpDir.delete()
        tmpDir.mkdir()
        tmpDir.deleteOnExit()
        mockConfig("\nmacademia.profileImagePath = 'web-app/images/db'\n")
        is = new ImageService()
        super.setUp()
    }

    protected void tearDown() {
        if (tmpDir.isDirectory()) {
            tmpDir.deleteDir()
        }
        super.tearDown()
    }

    public void testConstructPath(){
        File path1 = is.constructPath("foo/bar", 234242242, false)
        assertEquals(path1, new File("foo/bar/42/22/234242242.png"))
        File path2 = is.constructPath(tmpDir.toString(), 329942931, false)
        assertEquals(path2, new File(tmpDir, "31/29/329942931.png"))
        assertFalse(path2.getParentFile().isDirectory())
        File path3 = is.constructPath(tmpDir.toString(), 329942931, true)
        assertEquals(path2, path3)
        assertTrue(path2.getParentFile().isDirectory())
    }

    public void testResize() {
        File rescaled = new File(tmpDir, "/foo.png")
        assertTrue(TEST_IMG.isFile())
        is.resize(TEST_IMG, 0.5, rescaled)
        RenderedOp image = JAI.create("fileload", rescaled.toString());
        assertEquals(image.getWidth(), 90)
        assertEquals(image.getHeight(), 96)
        rescaled.delete()
    }

    public void testUploader() {
        File largeDest = new File("web-app/images/db/large/18/50/32425018.png")
        File smallDest = new File("web-app/images/db/small/18/50/32425018.png")
        if (largeDest.exists()) {
            largeDest.delete()
        }
        if (smallDest.exists()) {
            smallDest.delete()
        }
        if (!smallDest.getParentFile().isDirectory()) {
            smallDest.getParentFile().mkdirs()
        }
        if (!largeDest.getParentFile().isDirectory()) {
            largeDest.getParentFile().mkdirs()
        }
        MultipartFile file = new MockMultipartFile("foo", TEST_IMG.newInputStream())
        is.createNewImages(file, 32425018)
        RenderedOp image = JAI.create("fileload", smallDest.toString());
        assertEquals(image.getWidth(), 28)
        assertEquals(image.getHeight(), 29)
        image.dispose()
        smallDest.delete()

        image = JAI.create("fileload", largeDest.toString());
        assertEquals(image.getWidth(), 56)
        assertEquals(image.getHeight(), 59)
        image.dispose()
        largeDest.delete()
    }

    public void testCreateRandomImage() {
        MultipartFile file = new MockMultipartFile("foo", TEST_IMG.newInputStream())
        def id = is.createNewImages(file, -1)
        File largeDest = is.constructPath(ImageService.LARGE_IMAGES_PATH, id, false)
        RenderedOp image = JAI.create("fileload", largeDest.toString())
        assertEquals(image.getWidth(), 56)
        assertEquals(image.getHeight(), 59)
        image.dispose()
        largeDest.delete()
    }

}