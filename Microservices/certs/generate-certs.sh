#!/bin/bash

# Create certificates directory
mkdir -p certs

# Generate CA certificate
openssl req -x509 -newkey rsa:4096 -keyout certs/ca-key.pem -out certs/ca-cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Generate server certificate for all services
openssl req -newkey rsa:4096 -keyout certs/server-key.pem -out certs/server-req.pem -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Sign the server certificate with CA
openssl x509 -req -in certs/server-req.pem -CA certs/ca-cert.pem -CAkey certs/ca-key.pem -CAcreateserial -out certs/server-cert.pem -days 365

# Create PFX certificate for .NET
openssl pkcs12 -export -out certs/server.pfx -inkey certs/server-key.pem -in certs/server-cert.pem -certfile certs/ca-cert.pem -passout pass:password

# Set permissions
chmod 600 certs/*.pem
chmod 600 certs/*.pfx

echo "Certificates generated successfully!"
echo "CA Certificate: certs/ca-cert.pem"
echo "Server Certificate: certs/server-cert.pem"
echo "Server Private Key: certs/server-key.pem"
echo "PFX Certificate: certs/server.pfx"
