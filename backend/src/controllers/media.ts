import asyncHandler from "express-async-handler";
import {mediaRepository} from "../repositories/media";
import crypto from "crypto";
import {Readable} from "node:stream";

export const getChecksum = (fileBuffer: Buffer) => new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const readable = Readable.from(fileBuffer);
    readable.on('error', reject);
    readable.on('data', chunk => hash.update(chunk));
    readable.on('end', () => resolve(hash.digest('hex')));
});

export const getMediaHandler = asyncHandler(async (req, res) => {
    const mediaKey = req.params.mediaKey;

    const media = await mediaRepository.fetch(mediaKey);

    if (media) {
        res.setHeader('Content-Type', `${media.contentType}`);
        res.setHeader('Content-Disposition', `inline; filename=${media.filename}`);
        res.setHeader('Content-Length', `${media.size}`);
        res.status(200).send(Buffer.from(media.data, 'base64'));
    } else {
        res.sendStatus(404);
    }
});

export const getMediaMetadataHandler = asyncHandler(async (req, res) => {
    const mediaKey = req.params.mediaKey;
    const media = await mediaRepository.fetch(mediaKey);

    if (media) {
        res.status(200).json({type: media.contentType, filename: media.filename, size: media.size});
    } else {
        res.sendStatus(404);
    }
});

export const deleteMediaHandler = asyncHandler(async (req, res) => {
    const mediaKey = req.params.mediaKey;

    await mediaRepository.remove(mediaKey);

    res.sendStatus(200);
});
