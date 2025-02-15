import {
  Image,
  Container,
  Header,
} from 'semantic-ui-react'
import headerBackground from '@/assets/sidebar_header_background-wallpaperaccess400472.jpg';

const HeaderCard = (
  params: {
    profileImage?: string,
    name?: string,
    email?: string,
    role?: string,
  }) => (
  <Container text={true} fluid style={{ backgroundImage: 'url(' + headerBackground + ')', color: 'white'}} className='pt-5 ps-5'>
    <Header as='h2'>
      <Image circular
        src={params.profileImage || 'https://react.semantic-ui.com/images/avatar/large/matthew.png'}
      />
    </Header>
    <p>{params.name}</p>
    <p>{params.role}</p>
    <p>{params.email || 'Guest'}</p>
  </Container>
)

export default HeaderCard;
