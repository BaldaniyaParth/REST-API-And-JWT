exports.threeMinuteExpiry = async (otpTime) => {
  try {
    const c_datetime = new Date();

    var differenceValue = (otpTime - c_datetime.getTime()) / 1000; // Convert milliseconds to seconds
    differenceValue /= 60; // Convert seconds to minutes

    if (Math.abs(differenceValue) > 3) {
      return true;
    }

    return false;
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something Worng...",
    });
  }
};
