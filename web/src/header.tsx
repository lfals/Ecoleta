import React from 'react'


interface headerProps {
    title?: string;

}

const Header: React.FC<headerProps> = (props) => {
return (
        <header>
            <h1>{props.title}</h1>
        </header>
);
}
export default Header;