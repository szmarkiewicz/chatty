import {Schema, Repository} from 'redis-om';
import {redisQueryClient} from "../redis";

const userSchema = new Schema('user', {
    username: {type: 'string'},
    password: {type: 'string'},
    createdAt: {type: 'number', sortable: true},
    updatedAt: {type: 'number', sortable: true},
});

export const userRepository = new Repository(userSchema, redisQueryClient);
