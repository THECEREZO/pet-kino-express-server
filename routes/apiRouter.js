import { Router } from 'express';
import { Film } from '../database/database.js';
import multer, { MulterError } from 'multer';
import express from 'express';

const apiRouter = Router();

const multerAddImage = multer({
    storage: multer.diskStorage({
        destination: (_, file, cb) => {
            if (file.mimetype === 'image/png')
                cb(null, `uploads/${file.fieldname}`);
            else cb(new MulterError('Получен некорректный MIME тип файла'));
        },
        filename: (req, file, cb) => {
            const [name_file, extensions] = file.originalname.split('.');

            cb(
                null,
                (req.body.header ? req.body.header.trim() : name_file) +
                    '_' +
                    Date.now().toString() +
                    '.' +
                    extensions
            );
        },
    }),
    fileFilter: (_, file, cb) => {
        if (file.mimetype === 'image/png') {
            cb(null, true);
        } else
            cb(
                new MulterError('Данный тип файла не обслуживается сервером'),
                false
            );
    },
    // preservePath: true,
}).single('image');


apiRouter.post('/films/addFilm', async (req, res) => {
    multerAddImage(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ status: 'error', message: err });
        }

        const image = req.file;
        const { header, description, director, year, video } = req.body;

		console.log(image);

        try {
            if (
                !video ||
                !image ||
                !header ||
                !description ||
                !director ||
                !year
            ) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Получены не все аргументы с клиента',
                });
            }

            const data = await new Film({
                header,
                description,
                img: image.path,
                video,
                director,
                year,
            }).save();

            res.status(200).json(data);
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', message: error });
        }
    });
});

const multerUploadVideo = multer({
    storage: multer.diskStorage({
        destination: (_, file, cb) => {
            if (file.mimetype === 'video/mp4')
                cb(null, `uploads/${file.fieldname}`);
            else cb(new MulterError('Получен некорректный MIME тип файла'));
        },
        filename: (req, file, cb) => {
            const [name_file, extensions] = file.originalname.split('.');

            cb(
                null,
                (req.body.header ? req.body.header.trim() : name_file) +
                    '_' +
                    Date.now().toString() +
                    '.' +
                    extensions
            );
        },
    }),
    fileFilter: (_, file, cb) => {
        if (file.mimetype === 'video/mp4') {
            cb(null, true);
        } else
            cb(
                new MulterError('Данный тип файла не обслуживается сервером'),
                false
            );
    },
	preservePath: true
}).single('video');

apiRouter.post('/films/uploadVideo', async (req, res) => {
    multerUploadVideo(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ status: 'error', message: { ...err } });
        }

		const video = req.file;

		try {
			res.status(200).json(video);
		} catch (error) {
			console.log(error);
            res.status(500).json({ status: 'error', message: error });
		}
    });
});

apiRouter.get('/films', async (req, res, next) => {
    try {
        const response_films = await Film.find();
        res.status(200).json(response_films);
    } catch (error) {
        res.status(400).json({ status: 'error', message: error });
    }
});

apiRouter.get('/films/:id', async (req, res, next) => {
    try {
        const response_db = await Film.findById(req.params.id);

        if (!response_db._id)
            throw new Error({
                status: 'error',
                message: 'Film not find in database',
            });

        res.status(200).json(response_db);
    } catch (error) {
        // console.log(error);
        res.status(400).json({ status: 'error', message: error });
    }
});

export default apiRouter;
