import {createClient} from 'redis';

const host = process.env.REDIS_ENDPOINT_HOSTNAME || "127.0.0.1";
const port = parseInt(process.env.REDIS_ENDPOINT_PORT || "6379");

// This will connect to localhost on 6379 port
export const redisQueryClient = createClient({socket: { host, port }});
