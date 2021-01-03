server {

        listen 80;
        listen [::]:80;

        server_name api.anonderbazar.com www.api.anonderbazar.com;

	    keepalive_timeout 5;
    	client_max_body_size 4G;

    	access_log /var/log/nginx/api.access.log;
    	error_log /var/log/nginx/api.error.log;



    	location / {
        	proxy_set_header   X-Forwarded-For $remote_addr;
        	proxy_set_header   Host $http_host;
        	proxy_pass         "http://127.0.0.1:1339";
    	}

}