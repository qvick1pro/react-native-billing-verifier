import jsrsasign from 'jsrsasign-hermes';
import base64 from 'base-64';


export default function verify(transaction, publicKeyStr) {
    return new Promise(function (resolve, reject) {
        var sig = new jsrsasign.KJUR.crypto.Signature({ alg: 'SHA1withRSA' }),
            key = jsrsasign.KEYUTIL.getKey(formatPublicKey(publicKeyStr));

        sig.init(key);
        sig.updateString(transaction.receiptData);

        if (sig.verify(base64toHEX(transaction.receiptSignature))) {
            resolve(transaction);
        }
        else {
            let err = new Error('Purchase or subscribe is not verified');
            err.transactionDetails = transaction;
            reject(err);
        }
    });
}


function formatPublicKey(publicKeyStr) {
    var chunkSize = 64,
        chunks = [],
        s = publicKeyStr;

    while (s) {
        chunks.push(s.substr(0, chunkSize));
        s = s.substr(chunkSize);
    }

    s = chunks.join('\n');
    s = '-----BEGIN PUBLIC KEY-----\n' + s + '\n-----END PUBLIC KEY-----';

    return s;
}


function base64toHEX(s) {
    var raw = base64.decode(s),
        h,
        res = '';

    for (var i = 0; i < raw.length; i++) {
        h = raw.charCodeAt(i).toString(16);
        res += h.length == 2 ? h : '0' + h;
    }

    return res.toUpperCase();
}
