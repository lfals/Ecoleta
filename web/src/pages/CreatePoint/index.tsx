import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import {Link, useHistory} from 'react-router-dom'
import {FiArrowLeft} from 'react-icons/fi'
import { Map, TileLayer, Marker} from 'react-leaflet';
import api from '../../services/api'
import axios from 'axios';
import { LeafletMouseEvent} from 'leaflet'
import Dropzone from '../../components/Dropzone'

import logo from '../../assets/logo.svg'


import './styles.css'

interface Item {
    id: number;
    title: string;
    image_url: string;
}
interface IBGEUFResponse {
    nome: string;
    sigla: string;
}
interface IBGECityResponse {
    nome: string;

}

const CreatePoint = () => {

    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        name:'',
        email: '',
        whatsapp:'',
    })

    const [selectedUF, setSelectedUF] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [selectedFile, setSelectedFile] = useState<File>();

    const history = useHistory();        


    useEffect(() =>{
        api.get('items').then(response => {
            setItems(response.data);
            
        });
    },[]);

    useEffect(() =>{
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response =>{
            const ufNames = response.data.map(uf => uf.sigla);
            setUfs(ufNames);
    });
    },[]);

    useEffect(() =>{
        if(selectedUF === '0'){
            return;
        }

        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`).then(response =>{
            const cityNames = response.data.map(city => city.nome);
            setCities(cityNames);
        });
    },[selectedUF])

    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement> ) {
        const uf = event.target.value

        setSelectedUF(uf)
    }
    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement> ) {
        const city = event.target.value

        setSelectedCity(city)
    }
    function handelMapClick(event: LeafletMouseEvent){
       
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng,
        ])
    }
    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const { name, value} = event.target
       
        setFormData({...formData, [name]: value})
    }
    function handleSelecItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item === id);
        
        if (alreadySelected >= 0){
            const filteredItems = selectedItems.filter(item => item !== id);

            setSelectedItems(filteredItems)
            
        }else {
            setSelectedItems([...selectedItems, id])
        }

    }
    async function handleSubmit(event: FormEvent){
        event.preventDefault();

        const {name, email, whatsapp} = formData;
        const city = selectedCity;
        const uf = selectedUF;
        const [ latitude, longitude ] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();

            data.append('name', name);
            data.append('email', email);
            data.append('whatsapp', whatsapp);
            data.append('city', city);
            data.append('uf', uf);
            data.append('latitude', String(latitude));
            data.append('longitude', String(longitude));
            data.append('items', items.join(','));

            if(selectedFile){
                data.append('image', selectedFile) 
            }

        await api.post('points', data);

        alert('ponto de coleta criado')

        history.push('/');

    }


return (
<div id="page-create-point">


    <header>
        <img src={logo} alt="ecoleta" />

        <Link to="/">
        <FiArrowLeft />
        Voltar para home
        </Link>
    </header>


    <form onSubmit={handleSubmit}>
        <h1>Cadastro do<br /> pronto de coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile}/>


        <fieldset>
            <legend>
                <h2>dados</h2>
            </legend>
            <div className="field">
                <label htmlFor="name">Nome da Entidade</label>
                <input 
                    type="text"
                    name="name"
                    id="name"
                    onChange={handleInputChange}
                />
            </div>

            <div className="field-group">
                <div className="field">
                    <label htmlFor="email">E-mail</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        onChange={handleInputChange}
                    />
                </div>

                <div className="field">
                    <label htmlFor="whatsapp">whatsapp</label>
                    <input
                        type="text"
                        name="whatsapp"
                        id="whatsapp"
                        onChange={handleInputChange}
                    />
                </div>
            </div>
        </fieldset>

{/* ------------------------------------------------------------------------------ */}
        <Map center={[-22.4759582,-44.4653684]}zoom={14} onClick={handelMapClick}>
           <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
           />
            <Marker position={selectedPosition}></Marker>
        </Map>

        <fieldset>
            <legend>
                <h2>Endereço</h2>
                <span>selecione um endereço no mapa</span>
            </legend>

            <div className="field-group">

                <div className="field">
                    <label htmlFor="uf">Estado (UF)</label>
                    <select
                        name="uf"
                        id="uf"
                        value={selectedUF}
                        onChange={handleSelectedUf}
                    >
                        <option value="0">Selecione uma UF</option>

                        {ufs.map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                        ))}
                    </select>
                </div>

                <div className="field">
                    <label htmlFor="city">Cidade</label>
                    <select
                    name="city"
                    id="city"
                    value={selectedCity}
                    onChange={handleSelectedCity}
                    >
                        <option value="0">Selecione uma cidade</option>
                        
                        {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

            </div>

        </fieldset>

{/* ------------------------------------------------------------------------------ */}


        <fieldset>
            <legend>
                <h2>Ítens de coleta</h2>
                <span>selecione um ou mais items abaixo</span>
            </legend>

            <ul className="items-grid">
                {items.map(item =>(
                    <li key={item.id} onClick={() => handleSelecItem(item.id)} className={selectedItems.includes(item.id) ? 'selected' : ' '} >
                        <img src={item.image_url} alt={item.title}/>
                        <span>{item.title}</span>
                    </li>
                ))}
                
            </ul>
        </fieldset>

        <button type="submit">Cadastrar</button>

    </form>
</div>
)}
export default CreatePoint;