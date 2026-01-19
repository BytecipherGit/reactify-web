import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { register, clearError } from "../../store/reducers/authSlice";
import {
  Button,
  Input,
  Card,
  CardContent,
  StatusMessage,
  LoadingSpinner,
  Checkbox,
  Captcha,
  generateCaptcha,
  Select,
} from "../../components/ui";
import { api } from "../../lib/api";
import { AuthLayout } from "../../components/auth/AuthLayout";

interface Category {
  _id: string;
  title: string;
  [key: string]: any;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    profileType: "personal" as "personal" | "business",
    phone: "",
    countryCode: "1", // Default to US calling code
    phoneNumber: "",
    referralId: "",
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [checkTerms, setCheckTerms] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // CAPTCHA state
  const [captcha, setCaptcha] = useState<Array<{ char: string; style: any }>>(
    []
  );
  const [captchaString, setCaptchaString] = useState("");
  const [userCaptchaInput, setUserCaptchaInput] = useState("");

  // Fetch categories for business profile
  useEffect(() => {
      fetchCategories();
  }, []);

  // Initialize CAPTCHA
  useEffect(() => {
    const newCaptcha = generateCaptcha();
    setCaptcha(newCaptcha);
    setCaptchaString(newCaptcha.map((c) => c.char).join(""));
  }, []);

  // Get referral ID from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref) {
      setFormData((prev) => ({ ...prev, referralId: ref }));
    }
  }, []);

  const fetchCategories = async () => {
    try {
      // Use the api client which handles proxy correctly in development
      const response = await api.get('/auth/categories');
      setCategories(response.data?.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const refreshCaptcha = () => {
    const newCaptcha = generateCaptcha();
    setCaptcha(newCaptcha);
    setCaptchaString(newCaptcha.map((c) => c.char).join(""));
    setUserCaptchaInput("");
  };

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    dispatch(clearError());

    // Validation - matching mobile app
    if (formData.username.length < 3) {
      setLocalError("Username should be more than 3 characters");
      return;
    }

    if (formData.password.length < 7) {
      setLocalError("Password should be more than 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Password and confirm password should match");
      return;
    }

    if (formData.profileType === "personal") {
      if (formData.firstName.length < 3 || formData.lastName.length < 3) {
        setLocalError(
          "First name and last name should be more than 3 characters"
        );
        return;
      }
    }

    if (formData.profileType === "business" && !selectedCategory) {
      setLocalError("Please select a category");
      return;
    }

    if (!checkTerms) {
      setLocalError("Please accept terms and conditions/privacy policy");
      return;
    }

    // CAPTCHA validation
    if (userCaptchaInput !== captchaString) {
      setLocalError("CAPTCHA did not match. Please try again.");
      refreshCaptcha();
      return;
    }

    try {
      // Prepare phone number with country code (matching mobile app logic)
      // Mobile app: phone = "+" + countryCode.callingCode[0] + phoneNumber
      // Mobile app: code = countryCode?.cca2 (e.g., "US")
      let phone = "";
      let code = "US";
      if (formData.profileType === "business") {
        // Format: +[callingCode][phoneNumber]
        // formData.countryCode is the calling code number (e.g., "1" for US)
        if (formData.countryCode && formData.phoneNumber) {
          phone = `+${formData.countryCode}${formData.phoneNumber}`;
        } else if (formData.phoneNumber) {
          phone = `+1${formData.phoneNumber}`; // Default to US
        } else {
          phone = "";
        }
        // Map calling code to country code (cca2 format)
        // Simplified mapping - in production, use a proper country code library
        const countryCodeMap: Record<string, string> = {
          "1": "US",
          "44": "GB",
          "91": "IN",
          "61": "AU",
          "33": "FR",
          "49": "DE",
          "81": "JP",
          "86": "CN",
        };
        code = countryCodeMap[formData.countryCode] || "US";
      }

      // Prepare payload matching mobile app structure
      const registerPayload: any = {
        email: formData.email,
        profileType: formData.profileType,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.profileType === "business" ? phone : "",
        code: formData.profileType === "business" ? code : "",
        selectedOption:
          formData.profileType === "business" ? selectedCategory : null,
      };

      // Add referralId if provided
      if (formData.referralId && formData.referralId !== "0") {
        registerPayload.referralId = formData.referralId;
      }

      const result = await dispatch(register(registerPayload));
      if (register.fulfilled.match(result)) {
        // Navigate to verification page
        navigate("/verify-email", { state: { email: formData.email } });
      } else {
        setLocalError((result.payload as string) || "Registration failed");
      }
    } catch (err) {
      setLocalError("An unexpected error occurred");
    }
  };

  const displayError = localError || error;

  return (
    <AuthLayout>
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10 pointer-events-none" />
        <CardContent className="pt-4 relative">
          <div className="mb-4 text-xl font-semibold text-text">Create account</div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {displayError && (
              <StatusMessage
                type="error"
                message={displayError}
                gradient
                dismissible
                onDismiss={() => setLocalError(null)}
              />
            )}

          <div className="space-y-4">
            {/* Profile Type Selection */}
            <div>
              <div className="mb-2 text-sm font-semibold text-text">
                Account Type
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      profileType: "personal",
                    }))
                  }
                  className={`rounded-lg border-2 p-3 text-sm font-semibold transition-all duration-200 ${
                    formData.profileType === "personal"
                      ? "border-brand-primary bg-gradient-primary text-white shadow-md shadow-brand-primary/50"
                      : "border-border bg-bg-secondary text-text-secondary hover:border-brand-primary"
                  }`}
                >
                  Personal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      profileType: "business",
                    }))
                  }
                  className={`rounded-lg border-2 p-3 text-sm font-semibold transition-all duration-200 ${
                    formData.profileType === "business"
                      ? "border-brand-primary bg-gradient-primary text-white shadow-md shadow-brand-primary/50"
                      : "border-border bg-bg-secondary text-text-secondary hover:border-brand-primary"
                  }`}
                >
                  Business
                </button>
              </div>
            </div>

            {/* Business Category Selector */}
            {formData.profileType === "business" && (
              <Select
                id="category"
                label="What best describes you?"
                placeholder="Select an Option"
                value={selectedCategory?._id || ""}
                onChange={(e) => {
                  const category = categories.find(
                    (cat) => cat._id === e.target.value
                  );
                  setSelectedCategory(category || null);
                }}
                options={categories.map((cat) => ({
                  value: cat._id,
                  label: cat.title,
                }))}
                required
                disabled={loading || categories.length === 0}
                error={
                  formData.profileType === "business" &&
                  !selectedCategory &&
                  categories.length > 0
                    ? "Please select a category"
                    : undefined
                }
              />
            )}

            {/* Referral Profile ID */}
            <Input
              id="referralId"
              name="referralId"
              type="text"
              label="Referral Profile ID (Optional)"
              placeholder="Enter Referral Profile Id"
              value={formData.referralId}
              onChange={handleChange}
              disabled={loading}
            />

            {/* Username */}
            <Input
              id="username"
              name="username"
              type="text"
              label="Username"
              placeholder="Enter Username"
              required
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />

            {/* First Name & Last Name (Personal only) */}
            {formData.profileType === "personal" && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  label="First Name"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading}
                />
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  label="Last Name"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            )}

            {/* Email */}
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />

            {/* Phone Number (Business only) */}
            {formData.profileType === "business" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="w-32 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                  >
                    <option value="1">+1 (US/CA)</option>
                    <option value="44">+44 (UK)</option>
                    <option value="91">+91 (IN)</option>
                    <option value="61">+61 (AU)</option>
                    <option value="33">+33 (FR)</option>
                    <option value="49">+49 (DE)</option>
                    <option value="81">+81 (JP)</option>
                    <option value="86">+86 (CN)</option>
                    {/* Add more country codes as needed */}
                  </select>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={loading}
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Password"
              required
              showPasswordToggle
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />

            {/* Confirm Password */}
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Confirm Password"
              required
              showPasswordToggle
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />

            {/* CAPTCHA */}
            <Captcha
              value={userCaptchaInput}
              onChange={setUserCaptchaInput}
              onRefresh={refreshCaptcha}
              captchaText={captchaString}
              disabled={loading}
            />

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={checkTerms}
                onChange={(e) => setCheckTerms(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="terms" className="text-sm text-text-secondary">
                Do you agree to{" "}
                <a
                  href="https://reeltok.net/terms-and-services"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:text-brand-secondary"
                >
                  Terms and Conditions
                </a>
                /
                <a
                  href="https://reeltok.net/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:text-brand-secondary"
                >
                  Privacy policy
                </a>
              </label>
            </div>
          </div>

            <Button
              className="w-full bg-gradient-primary text-white hover:opacity-90"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" variant="white" />
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          <div className="mt-5 text-sm text-text-secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-gradient-primary hover:opacity-80 transition-opacity"
            >
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
