class TimeService {
  //convert time to expire time in korea
  timeToExpireTimeInKorea(timeObject, validPeriod) {
    const expireDateKoreanTime = new Date();
    expireDateKoreanTime.setTime(
      timeObject.getTime() +
        9 * 60 * 60 * 1000 +
        validPeriod * 24 * 60 * 60 * 1000
    );
    expireDateKoreanTime.setUTCHours(0, 0, 0, 0);
    return expireDateKoreanTime;
  }
}
const timeService = new TimeService();
module.exports = timeService;
