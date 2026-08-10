// ==========================================================
// DASHBOARD CARD
// ==========================================================

function DashboardCard({
    title,
    value,
    subtitle,
    icon,
    onClick,
    iconBg = "bg-blue-100",
    iconColor = "text-blue-600"
}) {

    return (

        <div
            onClick={onClick}
            className={`
                bg-white
                rounded-2xl
                border
                border-gray-100
                p-5
                transition-all
                duration-200
                shadow-sm
                ${
                    onClick
                        ? "cursor-pointer hover:shadow-lg hover:-translate-y-1"
                        : ""
                }
            `}
        >

            {/* ==================================================
                TOP SECTION
            ================================================== */}

            <div className="flex items-start justify-between">

                {/* ==================================================
                    TITLE
                ================================================== */}

                <div>

                    <p className="text-sm font-medium text-gray-500">

                        {title}

                    </p>

                    <h2 className="text-3xl font-bold text-gray-900 mt-2">

                        {value}

                    </h2>

                </div>


                {/* ==================================================
                    ICON
                ================================================== */}

                <div
                    className={`
                        w-12
                        h-12
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        ${iconBg}
                        ${iconColor}
                    `}
                >

                    {icon}

                </div>

            </div>


            {/* ==================================================
                SUBTITLE
            ================================================== */}

            {subtitle && (

                <p className="text-sm text-gray-500 mt-4">

                    {subtitle}

                </p>

            )}

        </div>

    );

}


// ==========================================================
// EXPORT
// ==========================================================

export default DashboardCard;