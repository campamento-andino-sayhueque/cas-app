import { useAuth } from "../hooks/useAuth";
import UserAvatar from "./UserAvatar";


export default function MobileHeader() {
    const { user } = useAuth()
    if(!user) return null

    return (
        <header className="md:hidden bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
                <div className="text-2xl font-bold">
                    <span className="text-[#FF6B35]">
                        CAS
                    </span>
                </div>
                <UserAvatar size="sm" showName={false} showDropdown />
            </div>
        </header>
    )
}
