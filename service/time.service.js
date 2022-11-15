class TimeService {
  timeToExpireTimeInKorea(timeObject, validPeriod) {
    const expireDateKoreanTime = new Date();
    expireDateKoreanTime.setTime(
      timeObject.getTime() +
        9 * 60 * 60 * 1000 +
        validPeriod * 24 * 60 * 60 * 1000
    );
    expireDateKoreanTime.setUTCHours(0, 0, 0, 0);
    console.log(expireDateKoreanTime);
    return expireDateKoreanTime;
  }
}
const timeService = new TimeService();
module.exports = timeService;
