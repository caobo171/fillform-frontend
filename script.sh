pm2 delete client
pm2 start yarn --name client -e PORT=4000 -- start --log-date-format 'YYYY-MM-DD HH:mm Z'