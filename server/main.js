const express = require("express");
const request = require("request");
const mysql = require('mysql');
const connection = mysql.createConnection({
    host:'localhost',
    user:'lottomatic',
    password:'Ji^1wOn#',
    port:3306,
    database:'mydb'
});

const getLottoInfoQuery = 'SELECT * FROM LOTTO_INFO WHERE DRW_NO=?';
const insertLottoInfoQuery = 'INSERT INTO LOTTO_INFO SET ?';
const app = express();

app.get("/", (req,res,next) => {
    //res.send("aaa");
    console.log("this is 1st");
    next();
}, (req,res,next) => {
    res.send("this is 2nd");
});

app.get("/lotto/:drwNo", (req,res) => {
    connection.query(getLottoInfoQuery, req.params.drwNo, function(err, rows, fields) {
        if(!err) {
            if(rows.length != 0) {
                console.log('result is here.' , rows);
                res.send(rows);
            } else {
                console.log('rows are null');
                request('https://www.nlotto.co.kr/common.do?method=getLottoNumber&drwNo=' + req.params.drwNo, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        console.log(body); // Show the HTML for the Google homepage. 
                        const data = JSON.parse(body);
                        //const returnData = [data.drwtNo1,data.drwtNo2,data.drwtNo3,data.drwtNo4,data.drwtNo5,data.drwtNo6];
            
                        console.log('start INSERT');

                        const lottoInfoObj = {
                            DRW_NO:data.drwNo,
                            DRW_NO_DATE:data.drwNoDate,
                            DRWT_NO1:data.drwtNo1,
                            DRWT_NO2:data.drwtNo2,
                            DRWT_NO3:data.drwtNo3,
                            DRWT_NO4:data.drwtNo4,
                            DRWT_NO5:data.drwtNo5,
                            DRWT_NO6:data.drwtNo6,
                            BNUS_NO:data.bnusNo,
                            TOTAL_SELL_AMNT:data.totSellamnt,
                            FIRST_WIN_ANMT:data.firstWinamnt,
                            FIRST_PRZ_WNER_CO:data.firstPrzwnerCo,
                            FIRST_ACCUM_AMNT:data.firstAccumamnt
                        };
                        connection.query(insertLottoInfoQuery,lottoInfoObj,function(err, rows, fields) {
                            if(!err) {
                                console.log('INSERT succeed!');
                                res.send(data);
                            } else {
                                console.log('error occured during INSERT',err);
                                res.send("exception occurred during INSERT query");
                            }
                        });
                    } else {
                        console.log('EXCEPTION occurred!', err);
                        res.send("exception occurred during call lotto api");
                    }
                });
            }
        } else {
            console.log('EXCEPTION occurred!', err);
        }
    });

});
    
app.post("/lotto/init", async (req,res) => {
    for(let drwNo = 1;drwNo < 1000; drwNo++) {
        console.log('start ', drwNo);
        await getAndInsertLottoInfo(drwNo);
        console.log('end', drwNo);
    }
    res.send('init is finished.');
});

function getAndInsertLottoInfo(drwNo) {
    return new Promise((resolve) => {
        console.log("what?");
        connection.query(getLottoInfoQuery, drwNo, function(err, rows, fields) {
            if(!err) {
                console.log('how?');
                if(rows.length == 0) {
                    console.log('drwNo ',drwNo, ' are null');
                    return new Promise((resolve2) => {
                        request('https://www.nlotto.co.kr/common.do?method=getLottoNumber&drwNo=' + drwNo, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                console.log(body); // Show the HTML for the Google homepage. 
                                const data = JSON.parse(body);
                                //const returnData = [data.drwtNo1,data.drwtNo2,data.drwtNo3,data.drwtNo4,data.drwtNo5,data.drwtNo6];
                    
                                console.log('start INSERT');

                                return new Promise((resolve3) => {
                                    const lottoInfoObj = {
                                        DRW_NO:data.drwNo,
                                        DRW_NO_DATE:data.drwNoDate,
                                        DRWT_NO1:data.drwtNo1,
                                        DRWT_NO2:data.drwtNo2,
                                        DRWT_NO3:data.drwtNo3,
                                        DRWT_NO4:data.drwtNo4,
                                        DRWT_NO5:data.drwtNo5,
                                        DRWT_NO6:data.drwtNo6,
                                        BNUS_NO:data.bnusNo,
                                        TOTAL_SELL_AMNT:data.totSellamnt,
                                        FIRST_WIN_ANMT:data.firstWinamnt,
                                        FIRST_PRZ_WNER_CO:data.firstPrzwnerCo,
                                        FIRST_ACCUM_AMNT:data.firstAccumamnt
                                    };
                                    connection.query(insertLottoInfoQuery,lottoInfoObj,function(err, rows, fields) {
                                        if(!err) {
                                            console.log('INSERT succeed!', drwNo);                                            
                                        } else {
                                            console.log('error occured during INSERT',err);
                                            res.send("exception occurred during INSERT query");
                                        }
                                        console.log('how about this?');
                                        resolve();
                                        console.log('point 0');
                                    });
                                    console.log('point 1');
                                });
                            } else {
                                console.log('EXCEPTION occurred!', err);
                                res.send("exception occurred during call lotto api");
                            }
                            console.log('point 2');
                            resolve();
                        });
                    });
                } else {
                    console.log("drwNo", drwNo, " existed");
                }
            } else {
                console.log('EXCEPTION occurred!', err);
            }
            resolve();
        });
    });
}
    

app.listen(3000, () => console.log("Listening on port 3000"));