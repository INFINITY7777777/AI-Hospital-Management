// ==========================================================
// DASHBOARD CARD COMPONENT
// Displays a single statistics card
// ==========================================================

function DashboardCard({ title, value }) {

    return (

        <div className="bg-white rounded-xl shadow p-6">

            {/* Card Title */}
            <h2 className="text-gray-500">
                {title}
            </h2>

            {/* Card Value */}
            <p className="text-3xl font-bold mt-2">
                {value}
            </p>

        </div>

    );

}

export default DashboardCard;