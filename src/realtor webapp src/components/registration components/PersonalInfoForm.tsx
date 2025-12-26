import React, { useState } from "react";
import { Link } from "react-router-dom";
import { trimValues } from "../../utils/trim";

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
};

const genders = ["Male", "Female", "Other"];

export const PersonalInfoForm: React.FC<Props> = ({
  initialData = {},
  onNext,
}) => {
  const [firstName, setFirstName] = useState(initialData.firstName ?? "");
  const [lastName, setLastName] = useState(initialData.lastName ?? "");
  const [phone, setPhone] = useState(initialData.phone ?? "");
  const [gender, setGender] = useState(initialData.gender ?? "");
  const [referral, setReferral] = useState(initialData.referral ?? "");

  const isValid =
    firstName.trim() && lastName.trim() && phone.trim() && gender.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    const trimmedData = trimValues({ firstName, lastName, phone, gender, referral });
    onNext(trimmedData as PersonalInfoData);
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
          onChange={(e) => setFirstName(e.target.value)}
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
          onChange={(e) => setLastName(e.target.value)}
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
          onChange={(e) => setPhone(e.target.value)}
          placeholder="xxxx xxx xxxx"
          className="w-full bg-[#FAFAFA] border border-[#F0F1F2] rounded-lg px-4 py-3 outline-none text-gray-800 placeholder-gray-400"
        />
      </div>

      {/* Gender */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Gender
        </label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
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
          onChange={(e) => setReferral(e.target.value)}
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
