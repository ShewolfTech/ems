import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
export const applyMiddleware = (app) => {
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
};
