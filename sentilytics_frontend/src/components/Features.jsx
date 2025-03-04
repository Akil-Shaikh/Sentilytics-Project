function Features(props) {
    const { title, info, list,image } = props.curElem;
    return (
        <>
            <div className="features-info">
                <img src={image} alt="" />
                <div className="info">
                    <h2>{title}</h2>
                    <p>{info}</p>
                    <ul>
                        {list && list.map((item, index) => (
                            <li key={index}>{item}</li>
                        )
                        )}
                    </ul>
                </div>
            </div>
        </>
    )
}

export default Features