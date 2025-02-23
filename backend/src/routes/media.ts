import {Router} from "express";
import {getMediaHandler, deleteMediaHandler, getMediaMetadataHandler} from "../controllers/media";
import {authenticateHandler} from "../controllers/auth";

export const mediaRouter = Router();

// Get media, all proper headers are set
mediaRouter.get('/:mediaKey', authenticateHandler, getMediaHandler);

// Get media metadata
mediaRouter.get('/metadata/:mediaKey', authenticateHandler, getMediaMetadataHandler);

// [NOT USED] Delete media from database
mediaRouter.delete('/:mediaKey', authenticateHandler, deleteMediaHandler);
