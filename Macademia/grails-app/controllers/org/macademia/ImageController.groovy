package org.macademia

import grails.converters.JSON

class ImageController {

    def imageService

    def retrieve = {
        retrieveInternal()
    }

    def retrieveOrig = {
        params.size =  'orig'
        retrieveInternal()
    }

    def retrieveInternal = {
        File path
        String imgDir
        if (params.size == 'orig') {
            imgDir = imageService.ORIG_IMAGES_PATH
        } else {
            imgDir = imageService.LARGE_IMAGES_PATH
        }
        if (params.id) {
            long id = params.id as long
            path = imageService.constructPath(imgDir, id, false)
        } else {
            path = new File(imgDir + '/' + params.subPath)
        }
        response.contentType = 'image/png'
        response.outputStream << path.readBytes()
        response.outputStream.flush()
    }

    def upload = {
        def imageId = imageService.createNewImages(request.getFile('Filedata'), -1)
        def path = imageService.constructPath("", imageId, false)
        render(path)
    }


    def fake = {
        def gender = params.gender
        def img = params.img

        if (!['male', 'female'].contains(gender)) {
            throw new IllegalArgumentException("unknown gender: ${gender}")
        }

        File path  = new File("db/nbrviz/${gender}pics/${img}")
        response.contentType = 'image/jpeg'
        response.outputStream << path.readBytes()
        response.outputStream.flush()
    }

    def randomFake = {
        Random r = new Random()
        params.gender = ['male', 'female'][r.nextInt(2)]
        String [] images = new File("db/nbrviz/${params.gender}pics").list()
        params.img = images[r.nextInt(images.length)];
        return fake()
    }
}
