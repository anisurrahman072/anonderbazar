server {

        listen 80;
        listen [::]:80;

        server_name anonderbazar.com www.anonderbazar.com;

	    keepalive_timeout 5;
    	client_max_body_size 4G;

    	access_log /var/log/nginx/web.access.log;
    	error_log /var/log/nginx/web.error.log;



    	location / {
        	proxy_set_header   X-Forwarded-For $remote_addr;
        	proxy_set_header   Host $http_host;
        	proxy_pass         "http://127.0.0.1:4200";
    	}

}