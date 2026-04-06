import AppLogo from "@/components/branding/logo";

import { OtpForm } from "@/features/auth/forms/otp/otp-form-02";
import { useOtp } from "@/features/auth/hooks/use-otp";

const Otp = () => {
  const { form, cooldown, isOtpPending, isOtpVerifying, handleSubmit, resendOtp } = useOtp();

  return (
    <div>
      <div className="hidden lg:flex p-5 absolute">
        <AppLogo />
      </div>
      <OtpForm
        cooldown={cooldown}
        form={form}
        isOtpVerifying={isOtpVerifying}
        isPending={isOtpPending}
        resendOtp={resendOtp}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default Otp;
