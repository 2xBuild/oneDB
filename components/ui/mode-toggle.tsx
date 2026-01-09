"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "./button"

export function ModeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" disabled className="text-muted-foreground">
                
               
            </Button>
        )
    }

    const isDark = resolvedTheme === "dark"

    return (
        <Button
            variant="link"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="text-foreground "
        >
            {isDark ? (
                <Sun className="h-5 w-5" />
            ) : (
                <Moon className="h-5 w-5" />
            )}
            
        </Button>
    )
}
