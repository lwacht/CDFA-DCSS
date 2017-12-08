/**
 * Helper utility that uses ssh2 library for sftp actions
 *
 * @author John Towell
 */

let Client = require('ssh2').Client;

const connSettings = () => {
    return {
        host: process.env.SFTP_HOST,
        port: process.env.SFTP_PORT,
        username: process.env.SFTP_USER,
        password: process.env.SFTP_PASSWORD
    };
};

module.exports = {
    put: (readStream, remoteFile) => {
        return new Promise((resolve, reject) => {
            let conn = new Client();
            conn.on('ready', function () {
                conn.sftp(function (err, sftp) {
                    if (err) reject(err);

                    let writeStream = sftp.createWriteStream(remoteFile);

                    writeStream.on('finish', () => {
                        resolve();
                        conn.end();
                    });

                    writeStream.on('error', (err) => {
                        reject(err);
                    });

                    // initiate transfer of file
                    readStream.pipe(writeStream);
                });
            }).connect(connSettings());
        });
    },

    get: (remoteFile, writeStream) => {
        return new Promise((resolve, reject) => {
            let conn = new Client();
            conn.on('ready', () => {
                conn.sftp((err, sftp) => {
                    if (err) reject(err);

                    let readStream = sftp.createReadStream(remoteFile);

                    writeStream.on('finish', () => {
                        conn.end();
                        resolve();
                    });

                    writeStream.on('error', (err) => {
                        reject(err);
                    });

                    // initiate transfer of file
                    readStream.pipe(writeStream);
                });
            }).connect(connSettings());
        });
    },

    delete: (remoteFile) => {
        return new Promise((resolve, reject) => {
            let conn = new Client();
            conn.on('ready', () => {
                conn.sftp((err, sftp) => {
                    if (err) reject(err);

                    sftp.unlink(remoteFile, (err) => {
                        if (err) {
                            console.log("Error deleting", err);
                            reject(err);
                        }
                        else {
                            console.log('deleted file');
                            resolve();
                        }
                        conn.end();
                    });
                });
            }).connect(connSettings());
        });
    },

    list: (remoteDir) => {
        return new Promise((resolve, reject) => {
            let conn = new Client();
            conn.on('ready', () => {
                conn.sftp((err, sftp) => {
                    if (err) reject(err);

                    sftp.readdir(remoteDir, (err, list) => {
                        if (err) {
                            console.log("Error listing dir " +remoteDir, err);
                            reject(err);
                        }
                        else {
                            resolve(list);
                        }
                        conn.end();
                    });
                });
            }).connect(connSettings());
        });
    }
};
