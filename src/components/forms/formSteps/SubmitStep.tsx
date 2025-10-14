export default function SubmitStep() {
    return (
      <div className="text-center space-y-3">
        <p className="text-gray-600">
          Please review all information carefully before submitting.
        </p>
        <button
          type="submit"
          className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition"
        >
          Submit Form
        </button>
      </div>
    );
  }
  