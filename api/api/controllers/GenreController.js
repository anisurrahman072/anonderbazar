/**
 * BrandController
 *
 * @description :: Server-side logic for managing brands
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

import {imageUploadConfig} from "../../libs/helper";

module.exports = {

    // destroy a row
    destroy: function (req, res) {
        Genre.update({id: req.param('id')}, {deletedAt: new Date()})
            .exec(function (err, genre) {
                if (err) return res.json(err, 400);
                return res.json(genre[0]);
            });
    },
    //Method called for creating a genre data
    //Model models/Genre.js
    create: function (req, res) {
        function create(body) {
            var genre = body;
          Genre.create(genre).exec(function (err, returnGenre) {
                if (err) {
                    return res.json(err.status, {err: err});
                }
                if (returnGenre) {
                    res.json(200, returnGenre);
                }
            });
        }

        if (req.body.hasImage == 'true') {
          const uploadConfig = imageUploadConfig();
            req.file('image').upload({
                ...uploadConfig,
                saveAs: Date.now() + '_genre.jpg'
            }, function (err, uploaded) {

                if (err) {
                    return res.json(err.status, {err: err});
                }
                var newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
                if (err) return res.serverError(err);
                req.body.image = '/' + newPath;
                create(req.body);
            });
        } else {
            create(req.body);
        }
    },

    //Method called for updating a genre data
    //Model models/Genre.js
    update: function (req, res) {
        if (req.body.hasImage == 'true') {
        req.file("image").upload(imageUploadConfig(),
        function(err, uploaded) {
            if (err) {
            return res.json(err.status, { err: err });
            }
            const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
            if (err) return res.serverError(err);
            req.body.image = "/" + newPath;
            Genre.update({ id: req.param("id") }, req.body).exec(function(
            err,
            genre
            ) {
            if (err) {
                return res.json(err.status, { err: err });
            }
            if (genre) {
                return res.json(200, {
                genre: genre,
                token: jwToken.issue({ id: genre.id })
                });
            }
            });
        }
        );
        } else {
          Genre.update({id: req.param('id')}, req.body)
                .exec(function (err, genre) {
                    if (err) return res.json(err, 400);
                    return res.json(200, genre);
                });
        }
    }
};

