import React, { useState } from "react";
import { Link } from "react-router-dom";
import { trimValues } from "../../utils/trim";
import { validateNigerianPhone } from "../../utils/ngPhone";

export type PersonalInfoData = {
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  referral?: string;
};

type Props = {
  initialData?: Partial<PersonalInfoData>;
  onNext: (data: PersonalInfoData) => void;
  onInputChange?: () => void;
};

const genders = ["Male", "Female", "Other"];

export const PersonalInfoForm: React.FC<Props> = ({
  initialData = {},
  onNext,
  onInputChange,
}) => {
  const [firstName, setFirstName] = useState(initialData.firstName ?? "");
  const [lastName, setLastName] = useState(initialData.lastName ?? "");
  const [phone, setPhone] = useState(initialData.phone ?? "");
  const [gender, setGender] = useState(initialData.gender ?? "");
  const [referral, setReferral] = useState(initialData.referral ?? "");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const isValid =
    firstName.trim() && lastName.trim() && phone.trim() && gender.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    if (!isValid) return;
    const trimmedData = trimValues({
      firstName,
      lastName,
      phone,
      gender,
      referral,
    });

    const phoneResult = validateNigerianPhone(String(trimmedData.phone ?? ""));
    if (!phoneResult.valid) {
      setPhoneError(
        "Enter a valid Nigerian phone number (e.g. 08012345678 or +2348012345678)"
      );
      return;
    }

    onNext({
      ...(trimmedData as PersonalInfoData),
      phone: phoneResult.normalized,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[375px] md:max-w-[720px] mx-auto px-6 py-1"
    >
      {/* Heading */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Personal Information
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Kindly fill in your details below
        </p>
      </div>

      {/* First name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          First name
        </label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => {
            setFirstName(e.target.value);
            if (onInputChange) onInputChange();
          }}
          placeholder="e.g John"
          className="w-full bg-[#FAFAFA] border border-[#F0F1F2] rounded-lg px-4 py-3 outline-none text-gray-800 placeholder-gray-400"
        />
      </div>

      {/* Last name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Last name
        </label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => {
            setLastName(e.target.value);
            if (onInputChange) onInputChange();
          }}
          placeholder="e.g Doe"
          className="w-full bg-[#FAFAFA] border border-[#F0F1F2] rounded-lg px-4 py-3 outline-none text-gray-800 placeholder-gray-400"
        />
      </div>

      {/* Phone number */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Phone number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (phoneError) setPhoneError(null);
            if (onInputChange) onInputChange();
          }}
          placeholder="e.g 08012345678"
          inputMode="tel"
          autoComplete="tel"
          className="w-full bg-[#FAFAFA] border border-[#F0F1F2] rounded-lg px-4 py-3 outline-none text-gray-800 placeholder-gray-400"
          aria-invalid={Boolean(phoneError)}
        />
        {phoneError && <p className="mt-2 text-xs text-red-600">{phoneError}</p>}
      </div>

      {/* Gender */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Gender
        </label>
        <select
          value={gender}
          onChange={(e) => {
            setGender(e.target.value);
            if (onInputChange) onInputChange();
          }}
          className="w-full bg-[#FAFAFA] border border-[#F0F1F2] rounded-lg px-4 py-3 outline-none text-gray-800"
        >
          <option value="">Select gender</option>
          {genders.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Referral code */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Referral code
        </label>
        <input
          type="text"
          value={referral}
          onChange={(e) => {
            setReferral(e.target.value);
            if (onInputChange) onInputChange();
          }}
          placeholder="Enter referral code"
          className="w-full bg-[#FAFAFA] border border-[#F0F1F2] rounded-lg px-4 py-3 outline-none text-gray-800 placeholder-gray-400"
        />
      </div>

      {/* CTA */}
      <div className="mb-4">
        <button
          type="submit"
          disabled={!isValid}
          className={`w-full rounded-xl py-4 font-medium text-lg transition-all ${
            isValid
              ? "bg-[#6500AC] text-white hover:opacity-95 focus:ring-2 focus:ring-[#6500AC]/40"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          Proceed
        </button>
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-gray-600">
        I have an account?{" "}
        <Link to="/login" className="text-[#6500AC] underline">
          Login
        </Link>
      </p>
    </form>
  );
};
