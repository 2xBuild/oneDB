"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ArrowRight, Database, User as UserIcon, LogOut } from "lucide-react"
import { Button, ModeToggle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui"
import { useAuth } from "@/contexts/auth-context"

const navItems = [
    { name: "ARENA", href: "/arena" },
    { name: "DB", href: "/db" },
    { name: "CONTRIBUTION", href: "/db/contribution" },
]

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const { isAuthenticated, user, logout, isLoading } = useAuth()

    return (
        <>
            <nav className="bg-background border-b border-border">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Brand Logo & Name */}
                        <Link
                            href="/"
                            className="flex items-center gap-2 transition-opacity hover:opacity-80"
                        >
                            <Database className="h-6 w-6 text-foreground" />
                            <span className="font-sans text-lg font-semibold tracking-tight text-foreground">
                                oneDB
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex md:items-center md:gap-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-sm font-medium text-foreground uppercase tracking-wide transition-opacity hover:opacity-70"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            {!isLoading && (
                                <>
                                    {isAuthenticated ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors">
                                                    {user?.avatar ? (
                                                        <Image
                                                            src={user.avatar}
                                                            alt={user?.name || "User"}
                                                            width={32}
                                                            height={32}
                                                            className="rounded-full" // removed border classes
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    {user?.name && (
                                                        <span className="text-sm font-medium text-foreground">
                                                            {user.name}
                                                        </span>
                                                    )}
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56">
                                                <div className="px-2 py-1.5">
                                                    <p className="text-sm font-medium">{user?.name || "User"}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                                </div>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={logout}
                                                    variant="destructive"
                                                    className="cursor-pointer"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Log Out
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        <Button asChild variant="default" className="rounded-md bg-foreground text-background hover:opacity-90 dark:hover:text-background flex items-center gap-2">
                                            <Link href="/signin">
                                                LOG IN
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    )}
                                    <ModeToggle />
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center gap-2 md:hidden">
                            <Button
                                variant="link"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setIsOpen(!isOpen)}
                                aria-label="Toggle menu"
                            >
                                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {isOpen && (
                        <div className="pb-4 pt-2 md:hidden border-t border-border">
                            <div className="flex flex-col gap-2 mt-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className="text-sm font-medium text-foreground uppercase tracking-wide transition-opacity hover:opacity-70 px-2 py-2"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                {!isLoading && (
                                    <>
                                        {isAuthenticated ? (
                                            <>
                                                <div className="px-2 py-2 flex items-center gap-2">
                                                    {user?.avatar ? (
                                                        <Image
                                                            src={user.avatar}
                                                            alt={user?.name || "User"}
                                                            width={32}
                                                            height={32}
                                                            className="rounded-full border-2 border-border"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                                                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        {user?.name && (
                                                            <span className="text-sm font-medium text-foreground">
                                                                {user.name}
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-muted-foreground truncate">
                                                            {user?.email}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setIsOpen(false);
                                                    }}
                                                    className="text-sm font-medium text-foreground transition-opacity hover:opacity-70 text-left w-full px-2 py-2 flex items-center gap-2"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Log Out
                                                </button>
                                            </>
                                        ) : (
                                            <Link
                                                href="/signin"
                                                onClick={() => setIsOpen(false)}
                                                className="text-sm font-medium text-foreground uppercase tracking-wide transition-opacity hover:opacity-70 px-2 py-2 flex items-center gap-2"
                                            >
                                                LOG IN
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        )}
                                        <div className="px-2 py-2">
                                            <ModeToggle />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </>
    )
}