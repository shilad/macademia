package org.macademia

import grails.converters.JSON

class ImageController {

    def imageService

    def retrieve = {
        File path
        if (params.id) {
            long id = params.id as long
            path = imageService.constructPath(imageService.LARGE_IMAGES_PATH, id, false)
        } else {
            path = new File(imageService.LARGE_IMAGES_PATH + '/' + params.subPath)
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
}
