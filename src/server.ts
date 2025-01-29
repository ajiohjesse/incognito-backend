import { server } from '@/socket';
import { env } from './utils/env';

server.listen(env.PORT, () => {
  console.log('Server started');
});
