import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  CheckCircle,
  Calendar,
  Shield,
  Download,
  AlertTriangle,
} from "lucide-react";

const CertificatesPage = () => {
  return (
    <div className="min-h-screen px-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="container-custom py-6">
          <Link to="/" className="inline-flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documentation
          </Link>
          <div className="text-center">
            <Award className="h-16 w-16 mx-auto mb-4 text-amber-600" />
            <h1 className="text-3xl font-bold mb-2">Authorship Certificates</h1>
            <p className="text-lg text-gray-600">
              Prove authorship and protect your intellectual property
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          What are Authorship Certificates?
        </h2>
        <p className="text-gray-600 mb-4">
          Authorship Certificates provide cryptographic proof that you created a
          document at a specific time. They're ideal for protecting intellectual
          property, establishing priority, and proving academic authorship.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-semibold mb-2 text-amber-900">
            Secure & Verifiable
          </h3>
          <p className="text-amber-800">
            Each certificate includes a unique verification code, timestamp, and
            document hash. Anyone can verify authenticity online.
          </p>
        </div>
      </div>

      {/* Plan-Based Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">
          Certificate Features by Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Free Plan</h3>
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                Basic
              </span>
            </div>
            <ul className="space-y-3 mb-4">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">3 certificates/month</span>
              </li>
              <li className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>"FREE PLAN" watermark</strong>
                </span>
              </li>
              <li className="flex items-start">
                <Calendar className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>7-day retention</strong> (auto-deleted)
                </span>
              </li>
            </ul>
            <p className="text-sm text-gray-500 italic">
              Perfect for testing, but watermarked certificates are not suitable
              for professional use.
            </p>
          </div>

          {/* Student Plan */}
          <div className="border border-blue-500 rounded-xl p-6 bg-blue-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Student Plan</h3>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                Professional
              </span>
            </div>
            <ul className="space-y-3 mb-4">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">50 certificates/month</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>No watermark</strong>
                </span>
              </li>
              <li className="flex items-start">
                <Calendar className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>30-day retention</strong>
                </span>
              </li>
            </ul>
          </div>

          {/* Researcher Plan */}
          <div className="border border-purple-500 rounded-xl p-6 bg-purple-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Researcher Plan</h3>
              <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                Premium
              </span>
            </div>
            <ul className="space-y-3 mb-4">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Unlimited certificates</strong>
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>No watermark</strong>
                </span>
              </li>
              <li className="flex items-start">
                <Calendar className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Unlimited retention</strong> (never deleted)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Retention Policy */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          Certificate Retention Policy
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold mb-3 text-blue-900">
            Automatic Cleanup
          </h3>
          <p className="text-blue-800 mb-4">
            Certificates are automatically deleted based on your plan's
            retention period to manage storage:
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-3" />
              <strong className="mr-2">Free Plan:</strong>
              <span className="text-blue-900">Deleted after 7 days</span>
            </li>
            <li className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-3" />
              <strong className="mr-2">Student Plan:</strong>
              <span className="text-blue-900">Deleted after 30 days</span>
            </li>
            <li className="flex items-center">
              <Calendar className="h-5 w-5 text-green-600 mr-3" />
              <strong className="mr-2">Researcher Plan:</strong>
              <span className="text-blue-900">Kept forever (no deletion)</span>
            </li>
            <li className="flex items-center">
              <Calendar className="h-5 w-5 text-orange-600 mr-3" />
              <strong className="mr-2">PAYG:</strong>
              <span className="text-blue-900">
                Deleted immediately after download
              </span>
            </li>
          </ul>
          <p className="text-sm text-blue-700 mt-4 italic">
            💡 Tip: Download your certificates before they expire if you need to
            keep them long-term on the Free or Student plan.
          </p>
        </div>
      </div>

      {/* How to Generate */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          How to Generate a Certificate
        </h2>
        <div className="space-y-4">
          <div className="flex items-start border border-gray-200 rounded-lg p-4">
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100">
                <span className="text-amber-600 font-bold text-sm">1</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Complete Your Document</h3>
              <p className="text-gray-600 text-sm">
                Finish writing and ensure your document is in its final form
                before generating a certificate.
              </p>
            </div>
          </div>

          <div className="flex items-start border border-gray-200 rounded-lg p-4">
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100">
                <span className="text-amber-600 font-bold text-sm">2</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Navigate to Authorship</h3>
              <p className="text-gray-600 text-sm">
                Go to Dashboard → Authorship → Generate Certificate and select
                your project.
              </p>
            </div>
          </div>

          <div className="flex items-start border border-gray-200 rounded-lg p-4">
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100">
                <span className="text-amber-600 font-bold text-sm">3</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Configure Options</h3>
              <p className="text-gray-600 text-sm">
                Choose certificate type (Original Work, Collaboration, etc.) and
                whether to include a QR code for verification.
              </p>
            </div>
          </div>

          <div className="flex items-start border border-gray-200 rounded-lg p-4">
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100">
                <span className="text-amber-600 font-bold text-sm">4</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Generate & Download</h3>
              <p className="text-gray-600 text-sm">
                Click "Generate Certificate" and download the PDF. Save it
                securely for your records.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Verification */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Verifying a Certificate</h2>
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start">
            <Shield className="h-8 w-8 text-green-600 mr-4 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Online Verification</h3>
              <p className="text-gray-600 mb-3">
                Anyone can verify the authenticity of a certificate using the
                verification code or QR code:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>
                  Visit the verification URL on the certificate or scan the QR
                  code
                </li>
                <li>
                  The system will confirm the document hash, timestamp, and
                  author
                </li>
                <li>
                  If verified, the certificate is authentic and has not been
                  tampered with
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="p-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Need Professional Certificates?
            </h3>
            <p className="opacity-90 mb-4">
              Upgrade to remove watermarks and get longer retention periods for
              your authorship certificates.
            </p>
            <div className="flex gap-3">
              <Link
                to="/plans"
                className="inline-flex items-center px-4 py-2 bg-white text-amber-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                View Plans
              </Link>
              <Link
                to="/credits"
                className="inline-flex items-center px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/20">
                Buy Credits
              </Link>
            </div>
          </div>
          <Download className="h-16 w-16 opacity-20" />
        </div>
      </div>
    </div>
  );
};

export default CertificatesPage;
