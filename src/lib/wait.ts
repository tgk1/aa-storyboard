// tミリ秒の待ちを作る
export const wait = function (t: number) {
  return function () {
    return new Promise(function (resolve) {
      setTimeout(resolve, t);
    });
  };
};
