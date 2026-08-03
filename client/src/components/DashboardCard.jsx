// ==========================================================
// DASHBOARD CARD
// ==========================================================

function DashboardCard({
    title,
    value,
    onClick
}) {

    return (

        <div
            onClick={onClick}
            className={`
                bg-white
                rounded-xl
                shadow
                p-6
                transition
                duration-200
                ${
                    onClick
                        ? "cursor-pointer hover:shadow-lg hover:-translate-y-1"
                        : ""
                }
            `}
        >

            {/* ==========================================================
                TITLE
            ========================================================== */}

            <p className="text-gray-500">

                {title}

            </p>


            {/* ==========================================================
                VALUE
            ========================================================== */}

            <h2 className="text-3xl font-bold mt-2">

                {value}

            </h2>

        </div>

    );

}


// ==========================================================
// EXPORT
// ==========================================================

export default DashboardCard;