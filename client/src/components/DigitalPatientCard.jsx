// ==========================================================
// DIGITAL PATIENT CARD
// ==========================================================

function InfoItem({ label, value }) {

    return (
        <div>

            <p className="text-sm text-gray-500 mb-1">
                {label}
            </p>

            <p className="font-semibold text-gray-900 wrap-break-word">
                {value || "—"}
            </p>

        </div>
    );
}


// ==========================================================
// FORMAT DATE
// ==========================================================

const formatDate = (date) => {

    if (!date) {
        return "—";
    }

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
};


// ==========================================================
// DIGITAL PATIENT CARD
// ==========================================================

function DigitalPatientCard({ patient }) {

    return (

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="bg-blue-600 text-white p-6">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>

                        <p className="text-sm text-blue-100 font-medium">
                            DIGITAL PATIENT CARD
                        </p>

                        <h1 className="text-2xl md:text-3xl font-bold mt-1">
                            {patient.patient_name}
                        </h1>

                    </div>

                    <div className="bg-white/10 rounded-xl px-4 py-3">

                        <p className="text-xs text-blue-100">
                            Patient ID
                        </p>

                        <p className="font-bold">
                            #{patient.id}
                        </p>

                    </div>

                </div>

            </div>


            {/* ==================================================
                CARD BODY
            ================================================== */}

            <div className="p-6">


                {/* ==================================================
                    PERSONAL INFORMATION
                ================================================== */}

                <section>

                    <h2 className="text-lg font-bold text-gray-900 mb-5">
                        Personal Information
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                        <InfoItem
                            label="Age"
                            value={patient.age}
                        />

                        <InfoItem
                            label="Gender"
                            value={patient.gender}
                        />

                        <InfoItem
                            label="Blood Group"
                            value={patient.blood_group}
                        />

                        <InfoItem
                            label="Phone"
                            value={patient.phone}
                        />

                    </div>

                </section>


                {/* ==================================================
                    CONTACT INFORMATION
                ================================================== */}

                <section className="border-t mt-8 pt-6">

                    <h2 className="text-lg font-bold text-gray-900 mb-5">
                        Contact Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <InfoItem
                            label="Address"
                            value={patient.address}
                        />

                        <InfoItem
                            label="Emergency Contact"
                            value={patient.emergency_contact}
                        />

                    </div>

                </section>


                {/* ==================================================
                    MEDICAL INFORMATION
                ================================================== */}

                <section className="border-t mt-8 pt-6">

                    <h2 className="text-lg font-bold text-gray-900 mb-5">
                        Medical Information
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                        <InfoItem
                            label="Doctor"
                            value={patient.doctor}
                        />

                        <InfoItem
                            label="Ward"
                            value={patient.ward}
                        />

                        <InfoItem
                            label="Bed Number"
                            value={patient.bed_number}
                        />

                        <InfoItem
                            label="Admission Date"
                            value={formatDate(patient.admission_date)}
                        />

                    </div>


                    <div className="mt-6">

                        <InfoItem
                            label="Diagnosis"
                            value={patient.diagnosis}
                        />

                    </div>

                </section>


                {/* ==================================================
                    FOOTER
                ================================================== */}

                <section className="border-t mt-8 pt-5">

                    <p className="text-xs text-gray-500">
                        Patient information displayed from the
                        hospital management system.
                    </p>

                </section>

            </div>

        </div>
    );
}

export default DigitalPatientCard;