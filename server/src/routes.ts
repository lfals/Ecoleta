import express, { request, response } from 'express';
import multer from 'multer';
import multerConfig from './config/multer'
import { celebrate, Joi } from 'celebrate'

import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';

const routes = express.Router();
const upload = multer(multerConfig);

const itemsController = new ItemsController();
const pointsController = new PointsController();

routes.get('/items', itemsController.index);
routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);


routes.post(
    '/points',
    upload.single('image'),
    celebrate({
        body: Joi.object().keys({
          name: Joi.string().required(),  
          email: Joi.string().required().email(),  
          whatsapp: Joi.number().required(),  
          latitude: Joi.number().required(),  
          longitude: Joi.number().required(),  
          cidade: Joi.string().required(),  
          uf: Joi.string().required().max(2), 
          items: Joi.string().required(), 

        })
        
    },{
        abortEarly: false
    }),
    pointsController.create
);




//index, show, create, update, delete

export default routes;

//Service Pattern
//Repository Pattern (data mapper)