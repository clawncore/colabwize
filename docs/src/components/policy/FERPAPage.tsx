import { Link } from "react-router-dom";
import {
  Shield,
  User,
  Lock,
  FileText,
  CheckCircle,
  School,
} from "lucide-react";

const FERPAPage = () => {
  return (
    <div className="min-h-screen px-8 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-6">
          {/* Breadcrumb */}
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/" className="text-sm font-medium">
                  Documentation
                </Link>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-500 text-sm font-medium ml-1 md:ml-2">
                    FERPA Compliance
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            FERPA Compliance
          </h1>
          <p className="text-lg text-gray-600">
            How we comply with the Family Educational Rights and Privacy Act
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200 rounded-2xl p-8 mb-12">
          <div className="text-center">
            <School className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              FERPA Compliance
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              How we comply with the Family Educational Rights and Privacy Act
            </p>
          </div>
        </div>

        {/* FERPA Overview */}
        <div className="p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">
            Family Educational Rights and Privacy Act (FERPA)
          </h2>
          <p className="text-gray-600 mb-4">
            The Family Educational Rights and Privacy Act (FERPA) is a federal
            law that protects the privacy of student education records. The law
            applies to all schools that receive funds under an applicable
            program of the U.S. Department of Education.
          </p>
          <p className="text-gray-600">
            ColabWize is committed to full compliance with FERPA and protecting
            the privacy rights of all students and educational users. This page
            explains how we comply with FERPA requirements.
          </p>
        </div>

        {/* Key Principles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            FERPA Key Principles We Follow
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">
                  Student Privacy Rights
                </h3>
              </div>
              <p className="text-gray-600">
                We respect students' rights to inspect and review their
                education records and to request amendment of records that they
                believe are inaccurate or misleading.
              </p>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">
                  Consent for Disclosure
                </h3>
              </div>
              <p className="text-gray-600">
                We obtain written consent from students (or parents of students
                under 18) before disclosing personally identifiable information
                from education records, except where FERPA authorizes disclosure
                without consent.
              </p>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">Directory Information</h3>
              </div>
              <p className="text-gray-600">
                We carefully define and protect directory information, and
                provide students with the opportunity to opt out of directory
                information disclosure.
              </p>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                  <Lock className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold">Data Security</h3>
              </div>
              <p className="text-gray-600">
                We implement appropriate administrative, technical, and physical
                safeguards to protect the security, integrity, and
                confidentiality of student education records.
              </p>
            </div>
          </div>
        </div>

        {/* Individual Rights */}
        <div className="p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Rights Under FERPA</h2>
          <p className="text-gray-600 mb-6">
            As a student or parent of a student, you have specific rights under
            FERPA. We respect and facilitate these rights:
          </p>

          <div className="space-y-6">
            <div className="p-5">
              <h3 className="font-semibold mb-2">
                Right to Inspect and Review Records
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                You have the right to inspect and review your education records
                within 45 days of the day we receive a request for access.
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Request Record Access
              </button>
            </div>

            <div className="p-5">
              <h3 className="font-semibold mb-2">Right to Request Amendment</h3>
              <p className="text-gray-600 text-sm mb-3">
                You have the right to request that we amend your education
                records that you believe are inaccurate, misleading, or
                otherwise in violation of your privacy rights.
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Request Record Amendment
              </button>
            </div>

            <div className="p-5">
              <h3 className="font-semibold mb-2">
                Right to Consent to Disclosures
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                You have the right to consent to disclosures of personally
                identifiable information contained in your education records,
                except to the extent that FERPA authorizes disclosure without
                consent.
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Manage Disclosure Preferences
              </button>
            </div>

            <div className="p-5">
              <h3 className="font-semibold mb-2">Right to File a Complaint</h3>
              <p className="text-gray-600 text-sm mb-3">
                You have the right to file a complaint with the U.S. Department
                of Education concerning alleged failures by us to comply with
                the requirements of FERPA.
              </p>
              <a
                href="https://studentprivacy.ed.gov/complaint-process"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                File a Complaint with US DOE
              </a>
            </div>
          </div>
        </div>

        {/* Educational Institution Compliance */}
        <div className="p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">
            For Educational Institutions
          </h2>
          <p className="text-gray-600 mb-6">
            Educational institutions using ColabWize are responsible for
            ensuring their use of our services complies with FERPA. We provide
            tools and documentation to help institutions meet their obligations:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5">
              <h3 className="font-semibold mb-2">Data Agreements</h3>
              <p className="text-gray-600 text-sm">
                We provide standard data processing agreements and business
                associate agreements for educational institutions.
              </p>
            </div>

            <div className="p-5">
              <h3 className="font-semibold mb-2">Student Record Management</h3>
              <p className="text-gray-600 text-sm">
                Our platform includes tools for managing student records in
                compliance with FERPA requirements.
              </p>
            </div>

            <div className="p-5">
              <h3 className="font-semibold mb-2">Training Resources</h3>
              <p className="text-gray-600 text-sm">
                We offer training materials and best practices for FERPA
                compliance for institutional administrators.
              </p>
            </div>
          </div>
        </div>

        {/* Directory Information */}
        <div className="p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Directory Information</h2>
          <p className="text-gray-600 mb-4">
            Directory information is information contained in an education
            record that would not generally be considered harmful or an invasion
            of privacy if released. At ColabWize, we consider the following as
            directory information:
          </p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-600">
                Student's name, address, telephone number, date and place of
                birth
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-600">
                Major field of study, participation in officially recognized
                activities and sports
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-600">
                Weight and height of members of athletic teams
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-600">
                Dates of attendance, degrees and awards received
              </span>
            </li>
          </ul>
          <p className="text-gray-600">
            Students have the right to opt out of directory information
            disclosure by notifying us in writing.
          </p>
        </div>

        {/* Exceptions to Consent */}
        <div className="p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Exceptions to Consent</h2>
          <p className="text-gray-600 mb-4">
            FERPA permits disclosure of personally identifiable information from
            education records without consent in certain circumstances:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-600">
                To school officials with legitimate educational interests
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-600">
                To authorized representatives of the U.S. Comptroller General,
                the Attorney General, the Secretary of Education, or the
                Administrator of the Institute of Education Sciences
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-600">
                In connection with financial aid for which the student has
                applied or which the student has received
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-600">
                To state and local authorities within a juvenile justice system
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-600">
                To organizations conducting studies for or on behalf of the
                school
              </span>
            </li>
          </ul>
        </div>

        {/* Data Protection Officer */}
        <div className="p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Student Privacy Officer</h2>
          <p className="text-gray-600 mb-4">
            We have appointed a Student Privacy Officer who is responsible for
            overseeing our FERPA compliance and ensuring the protection of
            student education records.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2">
              Contact Our Student Privacy Officer
            </h3>
            <p className="text-gray-600 mb-3">
              If you have any questions about our FERPA compliance or wish to
              exercise your rights under FERPA, please contact our Student
              Privacy Officer:
            </p>
            <div className="flex items-center">
              <a
                href="mailto:spo@colabwize.com"
                className="text-blue-600 hover:text-blue-800 font-medium">
                spo@colabwize.com
              </a>
            </div>
          </div>
        </div>

        {/* Complaints */}
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6">Complaints</h2>
          <p className="text-gray-600 mb-4">
            If you believe that we have not complied with your rights under
            FERPA, you have the right to file a complaint with the Family Policy
            Compliance Office at the U.S. Department of Education.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">
              Family Policy Compliance Office
            </h3>
            <p className="text-gray-600 mb-2">
              U.S. Department of Education
              <br />
              400 Maryland Avenue, SW
              <br />
              Washington, DC 20202-8520
            </p>
            <a
              href="https://studentprivacy.ed.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium">
              Visit StudentPrivacy.gov
            </a>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white border-b border-gray-200 rounded-2xl p-8 mt-12">
          <div className="text-center max-w-2xl mx-auto">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              FERPA Questions or Requests?
            </h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about our FERPA compliance or wish to
              exercise your rights, please contact our Student Privacy Officer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:spo@colabwize.com"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center">
                Contact Student Privacy Officer
              </a>
              <Link
                to="/"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-center">
                Back to Documentation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FERPAPage;
