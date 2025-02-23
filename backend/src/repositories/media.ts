import {Schema, Repository} from 'redis-om';
import {redisQueryClient} from "../redis";

const mediaSchema = new Schema('media', {
    checksum: {type: 'string'},
    filename: {type: 'string'},
    size: {type: 'string'},
    contentType: {type: 'string'},
    data: {type: 'text'},
    createdAt: {type: 'number', sortable: true},
});

export const mediaRepository = new Repository(mediaSchema, redisQueryClient);