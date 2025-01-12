import { useEffect, useState } from 'react';
import './CoordinateList.css';
import { deleteAll, getAll, getByUser } from '../api/DbService';
import { Coordinate } from '../model/Coordinate';
import { IonButton, IonGrid, IonRow, IonCol, IonInput } from '@ionic/react';
import { refresh } from 'ionicons/icons';

const availableColors: string[] = ['red', 'white', 'blue', 'green', 'yellow', 'purple', 'cyan', 'magenta', 'pink'];

const CoordinateList: React.FC = () => {

    const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
    const [idClients, setIdClients] = useState<Set<string>>(new Set<string>());
    const [iconColorCount, setIconColorCount] = useState<Map<string, number>>(new Map<string, number>());
    const [clientColor, setClientColor] = useState<Map<string, string>>(new Map<string, string>());
    const [user, setUser] = useState('');

    const fetchAllCoordinates = async () => {
        const cs = await getAll();
        coordinates.push(...cs.data);
        setCoordinates(coordinates);
        const y = coordinates.map(cs => cs.user ? cs.user : 'anonimo')
        const x = new Set(y);
        setIdClients(x);
        initializeCss(x);

    }

    useEffect(() => {
        fetchAllCoordinates();
    }, []);

    const initializeCss = (idc: Set<string>): void => {

        initializeIconColor();
        assignColorToClient(idc);

    }

    const initializeIconColor = () => {
        for (let c of availableColors) {
            iconColorCount.set(c, 0)
        }
        setIconColorCount(iconColorCount);
    }

    const assignColorToClient = (idc: Set<string>): void => {
        for (let c of idc) {
            if (!clientColor.has(c)) {
                let luc = lessUsedColor();
                clientColor.set(c, luc);
                setClientColor(clientColor);
                iconColorCount.set(luc, iconColorCount.get(luc) + 1);
                setIconColorCount(iconColorCount)
            }
        }
    }

    const lessUsedColor = (): string => {

        let color: string;
        let arrayVal: number[] = Array.from(iconColorCount.values());
        let minor: number = Math.min(...arrayVal);

        iconColorCount.forEach((value, key, map) => {
            if (value === minor) {
                color = key;
            }
        })
        return color;
    }

    const refresh = async () => {
        setCoordinates([]);
        fetchAllCoordinates();
    }

    const _deleteAll = async () => {
        await deleteAll();
        setCoordinates([]);
    }

    const _getByUser = async (e: any) => {
        const coords = await getByUser(user);
        //coordinates.push(...coords.data)
        setCoordinates(prev => {
            prev.length = 0;
            prev.push(...coords.data);
            return prev;
        });
    }

    const onChangeHandler = event => {
        setUser(event.target.value);
    }

    const getCssClient = (user: string): string => {
        let color = 'red';
        if (clientColor.has(user)) {
            color = clientColor.get(user);
        }
        return color;

    }

    return (
        <div>

            <IonGrid>
                <IonRow>
                    <IonButton onClick={() => refresh()}>Refresh</IonButton>
                    <IonButton onClick={() => _deleteAll()}>Delete All</IonButton>
                </IonRow>
                <IonRow>
                    <IonInput onInput={(event) => onChangeHandler(event)} value={user} placeholder="Enter user"></IonInput>
                    <IonButton onClick={(e) => _getByUser(e)} > By user</IonButton >
                </IonRow>
                <IonRow>
                    <IonCol>n</IonCol>
                    <IonCol>Latitude</IonCol>
                    <IonCol>Longitude</IonCol>
                    <IonCol>Date</IonCol>
                    <IonCol>User</IonCol>
                    <IonCol>Group</IonCol>
                </IonRow>

                {coordinates && coordinates.map((c, i) => {
                    let z = getCssClient(c.user);
                    console.log(z);
                    return (
                        <IonRow key={i}>
                            <IonCol style={{ color: 'red' }}>{i}</IonCol>
                            <IonCol style={{ color: 'green' }}>{c.lat}</IonCol>
                            <IonCol style={{ color: 'yellow' }}>{c.ln}</IonCol>
                            <IonCol style={{ color: 'white' }}>{c.time ? c.time.toISOString() : ''}</IonCol>
                            <IonCol style={{ color: z }}>{c.user}</IonCol>
                            <IonCol style={{ color: 'pink' }}>{c.group}</IonCol>
                        </IonRow >
                    )
                })
                }

            </IonGrid >

        </div >
    );
};

export default CoordinateList;



