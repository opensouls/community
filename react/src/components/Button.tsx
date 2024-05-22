import React, { forwardRef } from 'react';

interface ButtonProps {
    label: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ label }, ref) => {
    return <button ref={ref}>{label}</button>;
});

export default Button;