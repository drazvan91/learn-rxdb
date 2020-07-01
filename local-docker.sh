docker build -t rxdb-test:1 .
docker rm my-rxdb-test
docker run -it -p 4040:80 --name my-rxdb-test rxdb-test:1