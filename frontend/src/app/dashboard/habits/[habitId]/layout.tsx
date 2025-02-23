// app/layout.tsx (or wherever your main layout is)
import { HabitModelProvider } from '@/components/chartsProgress/HabitModelContext';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <HabitModelProvider>
            {children}
        </HabitModelProvider>
    );
}