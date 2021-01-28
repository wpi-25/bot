import { createInterface } from 'readline';
import { client } from '..';

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});
rl.question(' ===== Press [ENTER] to shutdown cleanly =====\n', () =>
    shutdown(true)
);

export const shutdown = (really?: boolean) => {
    client.destroy();
    rl.close();
    if (really) console.log(' ===== Shutting down =====\n');
    else console.log(' ===== Restarting =====\n');
    process.exit(really ? 1 : 0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
